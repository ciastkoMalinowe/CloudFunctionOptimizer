resource "aws_efs_file_system" "montage-efs" {
   creation_token = "montage-efs"
   performance_mode = "generalPurpose"
   throughput_mode = "bursting"
   encrypted = "false"
 tags = {
     Name = "MontageEFS"
   }
 }
 
resource "aws_efs_mount_target" "montage-efs-mt-1" {
   file_system_id  = "${aws_efs_file_system.montage-efs.id}"
   subnet_id = "subnet-03383682aea0d0520"
   security_groups = ["sg-98c301df"]
 }
 
resource "aws_efs_mount_target" "montage-efs-mt-2" {
   file_system_id  = "${aws_efs_file_system.montage-efs.id}"
   subnet_id = "subnet-0d33a3cfc784e2c3d"
   security_groups = ["sg-98c301df"]
 }
 
resource "aws_efs_mount_target" "montage-efs-mt-3" {
   file_system_id  = "${aws_efs_file_system.montage-efs.id}"
   subnet_id = "subnet-0f1c9da7a02c0503a"
   security_groups = ["sg-98c301df"]
 }
 
resource "aws_efs_access_point" "test" {
   file_system_id = "${aws_efs_file_system.montage-efs.id}"
   posix_user = {
      uid = "1001"
      gid = "1001"
   }
   root_directory = {
      path = "/montage/0.5"
      creation_info = {
         owner_uid = "1001"
         owner_guid = "1001"
         permissions = "750"
      }
   }
}
