<?php

namespace App\ProductsBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Filesystem\Filesystem;
/**
 *
 * @ORM\Entity
 */
class ProductsPhoto
{
    /*
     * The maximum file size in MB
     */
    const UPLOAD_FILE_SIZE = 1;

    /**
     * @var integer $photo_id
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Products", inversedBy="photo")
     * @ORM\JoinColumn(name="product_id", referencedColumnName="id")
     */
    private $product_id;

    /**
     * @var string $photo
     *
     * @ORM\Column(name="photo", type="string", length=150)
     */
    private $photo;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set photo
     *
     * @param string $photo
     * @return ProductsPhoto
     */
    public function setPhoto($photo)
    {
        $this->photo = $photo;

        return $this;
    }

    /**
     * Get photo
     *
     * @return string 
     */
    public function getPhoto()
    {
        return $this->photo;
    }

    /**
     * Set product_id
     *
     * @param \App\ProductsBundle\Entity\Products $productId
     * @return ProductsPhoto
     */
    public function setProductId(\App\ProductsBundle\Entity\Products $productId = null)
    {
        $this->product_id = $productId;

        return $this;
    }

    /**
     * Get product_id
     *
     * @return \App\ProductsBundle\Entity\Products 
     */
    public function getProductId()
    {
        return $this->product_id;
    }


    public function getAbsolutePath()
    {
        return null === $this->file
            ? null
            : $this->getUploadRootDir().'/'.$this->file;
    }

    /*
     * The absolute directory path where uploaded
     * documents should be saved
     */
    protected function getUploadRootDir()
    {
        return __DIR__.'/../../../../web/'.$this->getUploadDir();
    }

    /*
     * The path to download the files
     */
    protected function getUploadDir()
    {
        return 'upload/images';
    }

    /**
     * Loading of the file and saving file behalf
     *
     * @ORM\PostPersist()
     * @ORM\PostUpdate()
     */
    public function upload()
    {
        if ($this->getFile() === null) {
            return;
        }

        $prefixName = sha1(uniqid(mt_rand(), true));
        $newName    = $prefixName . $this->getFile()->getClientOriginalName();

        $this->getFile()->move(
            $this->getUploadRootDir(),
            $newName
        );

        $this->photo = $prefixName . $this->getFile()->getClientOriginalName();
        $this->file  = null;
    }

    /**
     * @Assert\File(maxSize="1M")
     */
    private $file;

    /**
     * Sets file.
     *
     * @param UploadedFile $file
     */
    public function setFile(UploadedFile $file = null)
    {
        $this->file = $file;
    }

    /**
     * Get file.
     *
     * @return UploadedFile
     */
    public function getFile()
    {
        return $this->file;
    }


    /**
     * Deleting a file in the directory
     *
     * @ORM\PostRemove()
     */
    public function removeUpload()
    {
        $filesystem = new Filesystem();
        $file =  ($this->photo === null) ? null : $this->getUploadRootDir().'/'.$this->photo;
        if($file && $filesystem->exists($file)) {
            unlink($file);
        }
    }

    /**
     * Checking the size of the uploaded file
     *
     * @param $size - size of the uploaded file
     * @return bool
     */
    public function checkSize($size) {
        return ($size/1000000 < self::UPLOAD_FILE_SIZE);
    }
}
